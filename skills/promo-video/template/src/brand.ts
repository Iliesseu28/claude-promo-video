// Your app, as the end card and the drawn window show it. Replace these values with your app's.
export const BRAND = {
  name: "YourApp",
  /** The short promise of the end card, said by the last voice line. */
  promise: "Free and simple",
  /** Where to get it, in a pill under the promise. */
  store: "On the App Store",
  /** Your app icon: put it in public/app/icon.png and set "app/icon.png" here. null draws a placeholder. */
  icon: null as string | null,
  accent: "#4f6bff",
};

/** The stage background: a soft gradient, drawn in CSS (no image to prepare). */
export const WALLPAPER =
  "radial-gradient(1200px 700px at 18% 20%, rgba(120,150,255,0.55), transparent 60%)," +
  "radial-gradient(1000px 700px at 85% 85%, rgba(255,140,190,0.45), transparent 60%)," +
  "linear-gradient(135deg, #1d2a66 0%, #3a2f8f 45%, #7a3f9e 100%)";

export const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif';
