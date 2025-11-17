export const SiteConfig = {
  title: "Recall",
  description: "AI-powered learning system that converts passive content into active retention",
  prodUrl: "http://localhost:3000",
  appId: "hackthegap",
  domain: "localhost",
  appIcon: "/images/icon.png",
  company: {
    name: "Recall",
    address: "", // Not needed for hackathon
  },
  brand: {
    primary: "#8b5cf6", // Purple for education
  },
  team: {
    image: "/images/icon.png",
    website: "https://github.com/hugoganet/hack_the_gap",
    twitter: "",
    name: "Recall Team",
  },
  features: {
    /**
     * Image upload disabled for MVP
     */
    enableImageUpload: false as boolean,
    /**
     * Redirect logged-in users to /orgs (will become /courses later)
     */
    enableLandingRedirection: true as boolean,
  },
};
