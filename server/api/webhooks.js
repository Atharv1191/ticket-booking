// const clerkWebhooks = async (req, res) => {
//     console.log("📨 Webhook received at /webhooks");

//     try {
//         const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//         const evt = wh.verify(req.rawBody, {
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         });

//         console.log("✅ Webhook verified:", evt.type);
//         const { data, type } = evt;

//         switch (type) {
//             case 'user.created': {
//                 const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email_addresses[0]?.email_address || "User";

//                 const userData = {
//                     _id: data.id,
//                     name: fullName,
//                     email: data.email_addresses[0]?.email_address || "",
//                     image: data.image_url,
//                 };

//                 console.log("👤 Creating user:", userData);

//                 const createdUser = await User.create(userData);
//                 console.log("✅ User saved to DB:", createdUser._id);
//                 break;
//             }

//             case 'user.updated': {
//                 console.log("🔄 Updating user:", data.id);

//                 const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email_addresses[0]?.email_address || "User";

//                 const userData = {
//                     name: fullName,
//                     email: data.email_addresses[0]?.email_address || "",
//                     image: data.image_url,
//                 };

//                 await User.findByIdAndUpdate(data.id, userData);
//                 break;
//             }

//             case 'user.deleted': {
//                 console.log("🗑️ Deleting user:", data.id);
//                 await User.findByIdAndDelete(data.id);
//                 break;
//             }

//             default:
//                 console.warn("⚠️ Unhandled Clerk event type:", type);
//                 break;
//         }

//         res.status(200).json({});
//     } catch (error) {
//         console.error("❌ Webhook error:", error.message);
//         res.status(400).json({ success: false, message: error.message });
//     }
// };
// module.exports = { clerkWebhooks };


const { Webhook } = require("svix");
const clerkWebhooks = async (req, res) => {
  try {

    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verifying Headers
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Getting Data from request body
    const { data, type } = req.body

    // Switch Cases for differernt Events
    switch (type) {
      case 'user.created': {

        const userData = {
          _id: data.id,
                    name: fullName,
                    email: data.email_addresses[0]?.email_address || "",
                    image: data.image_url,
          
        }
        await User.create(userData)
        res.json({})
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          image: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        break;
    }

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

module.exports = { clerkWebhooks };