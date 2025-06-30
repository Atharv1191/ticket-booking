// const { Inngest } = require("inngest");
// const User = require("../models/User");

// const inngest = new Inngest({ id: "movie-ticket-booking" });



// //Inngest function to save user data to a database
// const syncUserCreation = inngest.createFunction(
//     {id:'sync-user-from-clerk'},
//     {event:"clerk/user.created"},
//     async({event})=>{
//         const {id,first_name,last_name,email_addresses,image_url} = event.data;
//         const userData = {
//             _id:id,
//             email:email_addresses[0].email_address,
//             name:first_name+" "+last_name,
//             image:image_url
//         }
//         await User.create(userData)
//     }
// )
// //Inngest Function to delete user from database
// const syncUserDeletion = inngest.createFunction(
//     {id:'delete-user-with-clerk'},
//     {event:"clerk/user.deleted"},
//     async({event})=>{
//         const {id} = event.data;
//         await User.findByIdAndDelete(id)

//     }
        
// )
// const syncUserUpdation = inngest.createFunction(
//     {id:'update-user-from-clerk'},
//     {event:"clerk/user.updated"},
//     async({event})=>{
//         const {id,first_name,last_name,email_addresses,image_url} = event.data;
//         const userData = {
//             _id:id,
//             email:email_addresses[0].email_address,
//             name:first_name+" "+last_name,
//             image:image_url
//         }
//         await User.findByIdAndUpdate(id,userData)
//     }
// )

// const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation];

// module.exports = { inngest, functions };
const { Inngest } = require("inngest");
const User = require("../models/User");

const inngest = new Inngest({ id: "movie-ticket-booking" });

// Function to handle user creation
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      console.log("Event received for user.created:", event.data);

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      if (!email_addresses || !email_addresses[0]) {
        throw new Error("Missing email address in event payload");
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      };

      await User.create(userData);
      console.log("User created successfully:", userData);
    } catch (error) {
      console.log("Error creating user:", error.message);
    }
  }
);

// Function to handle user deletion
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      console.log("Event received for user.deleted:", event.data);

      const { id } = event.data;
      await User.findByIdAndDelete(id);

      console.log("User deleted successfully:", id);
    } catch (error) {
      console.log("Error deleting user:", error.message);
    }
  }
);

// Function to handle user updates
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      console.log("Event received for user.updated:", event.data);

      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      if (!email_addresses || !email_addresses[0]) {
        throw new Error("Missing email address in event payload");
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      };

      await User.findByIdAndUpdate(id, userData);
      console.log("User updated successfully:", userData);
    } catch (error) {
      console.log("Error updating user:", error.message);
    }
  }
);

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

module.exports = { inngest, functions };
