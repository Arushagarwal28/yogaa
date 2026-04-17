export const SUBSCRIPTION_PLANS = [
  { name:"Free",     price:0,   label:"Starter",          color:"#64748b", popular:false,
    features:["Basic AI pose detection","5 yoga poses","Basic posture feedback","Limited analytics","Meditation timer","Limited ambient sounds","Yoga coins","Store access","Standard support"],
    missing: ["Angle-based analysis","Guided meditation library","Full analytics","Full pose library"] },
  { name:"Standard", price:200, label:"Most Popular",     color:"#16a34a", popular:true,
    features:["Full AI pose detection","10+ yoga poses","Angle-based feedback","Advanced analytics","Unlimited timer","Guided meditation","Full ambient sounds","Bonus yoga coins","Store discounts","Free delivery","Personalized plans","Priority support"],
    missing:[] },
  { name:"Premium",  price:500, label:"Advanced Wellness", color:"#7c3aed", popular:false,
    features:["All Standard features","Unlimited pose library","Advanced AI analysis","Personalized training","Smart progression","Advanced analytics","Meditation tracking","Premium meditations","Max coin rewards","Exclusive discounts","Early access","VIP support"],
    missing:[] },
];

export const FEATURE_TABLE = [
  { f:"AI Pose Detection",     free:true,      std:true,      pre:true },
  { f:"Basic Posture Feedback",free:true,      std:true,      pre:true },
  { f:"Angle-Based Feedback",  free:false,     std:true,      pre:true },
  { f:"Yoga Pose Library",     free:"Limited", std:"Full",    pre:"Unlimited" },
  { f:"Guided Meditation",     free:false,     std:true,      pre:true },
  { f:"Ambient Sounds",        free:"Limited", std:"Full",    pre:"Full" },
  { f:"Analytics Dashboard",   free:"Basic",   std:"Advanced",pre:"Advanced+" },
  { f:"Yoga Coin Rewards",     free:true,      std:true,      pre:true },
  { f:"Store Discounts",       free:false,     std:true,      pre:true },
  { f:"Free Delivery",         free:false,     std:true,      pre:true },
  { f:"Priority Support",      free:false,     std:true,      pre:true },
  { f:"VIP Support",           free:false,     std:false,     pre:true },
];