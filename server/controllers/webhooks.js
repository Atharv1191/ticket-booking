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
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                    
                };
                await User.create(userData);
                res.status(200).json({});
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`,
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.status(200).json({});
                break;
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                res.status(200).json({});
                break;
            }

            default:
                res.status(200).json({});
                break;
        }

    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { clerkWebhooks };
