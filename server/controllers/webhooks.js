const { Webhook } = require("svix");
const User = require("../models/User");

const clerkWebhooks = async (req, res) => {
    console.log("📨 Webhook received at /webhooks");

    let evt;

    try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        evt = wh.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });
        console.log("✅ Webhook verified. Event type:", evt.type);
    } catch (verifyError) {
        console.error("❌ Verification failed:", verifyError.message);
        return res.status(400).json({ success: false, message: "Webhook verification failed" });
    }

    const { data, type } = evt;

    try {
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };
                console.log("👤 Creating user:", userData);

                const createdUser = await User.create(userData);
                console.log("✅ User created in MongoDB:", createdUser._id);
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };
                console.log("🔄 Updating user:", data.id, userData);

                await User.findByIdAndUpdate(data.id, userData);
                console.log("✅ User updated");
                break;
            }

            case 'user.deleted': {
                console.log("🗑️ Deleting user:", data.id);

                await User.findByIdAndDelete(data.id);
                console.log("✅ User deleted");
                break;
            }

            default:
                console.warn("⚠️ Unhandled event type:", type);
                break;
        }

        res.status(200).json({});
    } catch (handlerError) {
        console.error("❌ Error handling event:", handlerError.message);
        res.status(500).json({ success: false, message: handlerError.message });
    }
};

module.exports = { clerkWebhooks };
