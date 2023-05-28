const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        country: {
            type: String,
            required: true,
        },
        pinCode: {
            type: Number,
            required: true,
        },
        phoneNo: {
            type: Number,
            required: true,
        },
        datetravel:{
            type: Date,
            required: true,
        },
        datetravels:{
            type: Date,
            required: true,
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            product: {
                type: mongoose.Schema.ObjectId,
                // ref: "Product",
                required: true,
            }, 
            quantity: {
                type: Number,
            },
            type :{
                type : String,
            },
            vendor: {
                type: mongoose.Schema.ObjectId,
                ref: "Vendor",
                required :true
            },
           
        },
    ],
//  orderItems : [
//   {
//     name: req.body.name,
//     price: req.body.price,
//     image: req.body.image,
//     product: req.body.product1 ? [req.body.product1] : [req.body.product],
//     type: req.body.type,
//     vendor: req.body.vendor,
//   },
// ],
//   glitch:{
//     type: String,
//     required: true,
//   },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    // vendor: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Vendor",
    //     required: true,
    // },
    paymentInfo: {
        id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    paidAt: {
        type: Date,
        required: true,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing",
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// orderSchema.virtual("findv", {
//     ref: "Product",
//     localField: "orderItems.product",
//     foreignField: "_id",
//     justOne: false,
//     populate: {
//         path: "vendor",
//         select: "_id", // Select the _id field of the vendor object
//     },
// });

// orderSchema.pre("save", async function () {
//     // Loop through each item in the `orderItems` array
//     for (const item of this.orderItems) {
//         // If the `vendor` field is not already set, populate it using the `findv` virtual property
//         if (!item.vendor) {
//             await this.populate("findv").execPopulate();
//             item.vendor = item.product.vendor;
//         }
//     }
// });



module.exports = mongoose.model("Order", orderSchema);