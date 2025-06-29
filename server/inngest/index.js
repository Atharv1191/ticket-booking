// inngest/index.js
const { Inngest } = require('inngest');
const User = require('../models/User');

const inngest = new Inngest({ id: 'movie-ticket-booking' });

const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      console.log('📥 Received user.created:', JSON.stringify(event.data, null, 2));
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url
      };
      const user = await User.create(userData);
      console.log('✅ User created:', user._id);
    } catch (err) {
      console.error('❌ Error creating user:', err);
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-with-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    try {
      console.log('📥 Received user.updated:', JSON.stringify(event.data, null, 2));
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const updateData = {
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url
      };
      const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
      console.log('✅ User updated:', updated?._id);
    } catch (err) {
      console.error('❌ Error updating user:', err);
    }
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-with-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    try {
      console.log('📥 Received user.deleted:', JSON.stringify(event.data, null, 2));
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      console.log('✅ User deleted:', id);
    } catch (err) {
      console.error('❌ Error deleting user:', err);
    }
  }
);

module.exports = { inngest, functions: [syncUserCreation, syncUserUpdation, syncUserDeletion] };
