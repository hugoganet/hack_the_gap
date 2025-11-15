export const SiteConfig = {
  title: "Hack the Gap",
  description: "AI-powered learning system that converts passive content into active retention",
  prodUrl: "http://localhost:3000",
  appId: "hackthegap",
  domain: "localhost",
  appIcon: "/images/icon.png",
  company: {
    name: "Hack the Gap",
    address: "", // Not needed for hackathon
  },
  brand: {
    primary: "#3b82f6", // Blue for education
  },
  team: {
    image: "/images/icon.png",
    website: "https://github.com/hugoganet/hack_the_gap",
    twitter: "",
    name: "Hack the Gap Team",
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
