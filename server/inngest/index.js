const { Inngest } = require("inngest");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { sendEmail } = require("../configs/nodemailer");

const inngest = new Inngest({ id: "movie-ticket-booking" })

// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     const userData = {
//       _id: id,
//       email: email_addresses[0].email_address,
//       name: `${first_name} ${last_name}`,
//       image: image_url,
//     };
//     await User.create(userData);
//   }
// );
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    try {
      console.log("📩 Event received:", event.data?.id);

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url || "",
      };

      console.log("📥 Saving user:", userData);

      await User.create(userData);

      console.log("✅ User created successfully");

      return { success: true };
    } catch (error) {
      console.error("❌ Error in syncUserCreation:", error.message);
      throw error;
    }
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
  }
);

//inngest function to cancel booking and release seats of show affter 10 minuitws of booking created if paymnt is not made

const releaseSeatsAndDeleteBokking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If payment is not made, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);

        for (const seat of booking.bookedSeats) {
          delete show.occupiedSeats[seat];
        }

        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);


//inngest function to send email when user books a show

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId).populate({
      path: "show",
      populate: { path: "movie", model: "Movie" }
    }).populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Hi ${booking.user.name},</h2>
  <p>Your booking for <strong>${booking.show.movie.title}</strong> is confirmed.</p>
  <p>
    <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}<br/>
    <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
  </p>
  <p>Enjoy the show!</p>
  <p>Thanks for booking with us!<br/>– QuickShow Team</p>
</div>
`
    })
  }
)

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBokking,sendBookingConfirmationEmail];

module.exports = { inngest, functions };
