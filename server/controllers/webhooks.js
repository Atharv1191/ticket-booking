const { Webhook } = require("svix");
const User = require("../models/User");

const clerkWebhooks = async (req, res) => {
    try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const evt = wh.verify(req.rawBody, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = evt;

        switch (type) {
            case 'user.created': {
                const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email_addresses[0]?.email_address || "User";

                const userData = {
                    _id: data.id,
                    name: fullName,
                    email: data.email_addresses[0]?.email_address || "",
                    image: data.image_url,
                };

                await User.create(userData);
                break;
            }

            case 'user.updated': {
                const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email_addresses[0]?.email_address || "User";

                const userData = {
                    name: fullName,
                    email: data.email_addresses[0]?.email_address || "",
                    image: data.image_url,
                };

                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        res.status(200).json({});
    } catch (error) {
        console.error("❌ Webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { clerkWebhooks };
