const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Budgettrip",
    },
    payment_method_types: ["card"],
    payment_method_options: {
      card: {
        request_three_d_secure: "any",
      },
    },
  });

  res
    .status(200)
    .cookie("client_secret", myPayment.client_secret)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
