// const { Inngest } = require("inngest");
// const User = require("../models/User");

// const inngest = new Inngest({ id: "movie-ticket-booking" });

// // Inngest function to save user data to the database
// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     const userData = {
//       _id: id,
//       email: email_addresses[0]?.email_address,
//       name: `${first_name} ${last_name}`,
//       image: image_url,
//     };
//     await User.create(userData);
//   }
// );

// // Inngest function to delete user from the database
// const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-with-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     const { id } = event.data;
//     await User.findByIdAndDelete(id);
//   }
// );

// // Inngest function to update user in the database
// const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-with-clerk" },
//   { event: "clerk/user.updated" },
//   async ({ event }) => {
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     const userData = {
//       email: email_addresses[0]?.email_address,
//       name: `${first_name} ${last_name}`,
//       image: image_url,
//     };
//     await User.findByIdAndUpdate(id, userData);
//   }
// );

// const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

// module.exports = {
//   inngest,
//   functions,
// };
const { Inngest } = require("inngest");
const User = require("../models/User");

const inngest = new Inngest({ id: "movie-ticket-booking" });

// Clerk user.created → Save user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      console.log("📥 Received user.created:", JSON.stringify(event.data, null, 2));
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url,
      };

      const user = await User.create(userData);
      console.log("✅ User saved:", user._id);
    } catch (err) {
      console.error("❌ Failed to save user:", err.message);
    }
  }
);

// Clerk user.updated → Update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-with-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      console.log("📥 Received user.updated:", JSON.stringify(event.data, null, 2));
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url,
      };

      const updated = await User.findByIdAndUpdate(id, userData, { new: true });
      console.log("✅ User updated:", updated?._id);
    } catch (err) {
      console.error("❌ Failed to update user:", err.message);
    }
  }
);

// Clerk user.deleted → Delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      console.log("📥 Received user.deleted:", JSON.stringify(event.data, null, 2));
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      console.log("✅ User deleted:", id);
    } catch (err) {
      console.error("❌ Failed to delete user:", err.message);
    }
  }
);

const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];

module.exports = {
  inngest,
  functions,
};
