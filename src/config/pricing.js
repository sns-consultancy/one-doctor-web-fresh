const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    description: "30 days free trial with all features",
    features: [
      "100MB Storage",
      "100 Queries/Day",
      "No Video Uploads"
    ],
    stripePriceId: null
  },
  {
    id: "basic",
    name: "Basic",
    price: 4.99,
    description: "For individuals needing more resources",
    features: [
      "1GB Storage",
      "500 Queries/Day",
      "Basic Video Uploads"
    ],
    stripePriceId: "price_basic_123"
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    description: "Advanced plan for professionals",
    features: [
      "10GB Storage",
      "Unlimited Queries",
      "HD Video Uploads"
    ],
    stripePriceId: "price_pro_456"
  }
];

export default plans;
