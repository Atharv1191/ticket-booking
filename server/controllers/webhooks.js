const { Webhook } = require("svix");
const User = require("../models/User");

const clerkWebhooks = async (req, res) => {
    try {
        console.log("📨 Webhook received at /webhooks");
        console.log("Headers:", {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const evt = wh.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = evt;
        console.log("✅ Webhook verified. Event type:", type);

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };
                console.log("👤 Creating user:", userData);

                try {
                    const createdUser = await User.create(userData);
                    console.log("✅ User created in MongoDB:", createdUser._id);
                } catch (err) {
                    console.error("❌ Error creating user:", err.message);
                }

                res.status(200).json({});
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };
                console.log("🔄 Updating user:", data.id, userData);

                try {
                    await User.findByIdAndUpdate(data.id, userData);
                    console.log("✅ User updated");
                } catch (err) {
                    console.error("❌ Error updating user:", err.message);
                }

                res.status(200).json({});
                break;
            }

            case 'user.deleted': {
                console.log("🗑️ Deleting user:", data.id);

                try {
                    await User.findByIdAndDelete(data.id);
                    console.log("✅ User deleted");
                } catch (err) {
                    console.error("❌ Error deleting user:", err.message);
                }

                res.status(200).json({});
                break;
            }

            default:
                console.warn("⚠️ Unhandled event type:", type);
                res.status(200).json({});
                break;
        }

    } catch (error) {
        console.error("❌ Webhook error (outer catch):", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { clerkWebhooks };
