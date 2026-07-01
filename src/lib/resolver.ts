import { ASSETS } from "./assets";

export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return "";

  // If the url is already an absolute external url, or a standard relative public url
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) {
    return url;
  }

  // Handle lovable proxy assets and other relative file assets
  const lowerUrl = url.toLowerCase();

  if (
    url.startsWith("/__l5e/assets-v1/") ||
    url.startsWith("src/assets/") ||
    url.includes("/assets-v1/") ||
    url.endsWith(".jpg") ||
    url.endsWith(".png") ||
    url.endsWith(".mp4")
  ) {
    if (lowerUrl.includes("burgundy-manicure") || lowerUrl.includes("hero-manicure")) {
      return ASSETS.burgundyManicure;
    }
    if (lowerUrl.includes("polka-dot-nails")) {
      return ASSETS.polkaDotNails;
    }
    if (lowerUrl.includes("salon-pedicure")) {
      return ASSETS.salonPedicure;
    }
    if (lowerUrl.includes("mindful-candle")) {
      return ASSETS.mindfulCandle;
    }
    if (lowerUrl.includes("workstation")) {
      return ASSETS.workstation;
    }
    if (lowerUrl.includes("led-lamp")) {
      return ASSETS.ledLamp;
    }
    if (lowerUrl.includes("polish-shelves")) {
      return ASSETS.polishShelves;
    }
    if (lowerUrl.includes("baskets-corner")) {
      return ASSETS.basketsCorner;
    }
    if (lowerUrl.includes("bar-shelf")) {
      return ASSETS.barShelf;
    }
    if (lowerUrl.includes("coffee-easel")) {
      return ASSETS.coffeeEasel;
    }
    if (lowerUrl.includes("hero-services")) {
      return ASSETS.heroServices;
    }
    if (lowerUrl.includes("hero-tarifs")) {
      return ASSETS.heroTarifs;
    }
    if (lowerUrl.includes("hero-about")) {
      return ASSETS.heroAbout;
    }
    if (lowerUrl.includes("hero-contact")) {
      return ASSETS.heroContact;
    }
    if (lowerUrl.includes("hero-loop")) {
      return ASSETS.heroLoopVideo;
    }
    if (lowerUrl.includes("gesture-loop")) {
      return ASSETS.gestureLoopVideo;
    }
    if (lowerUrl.includes("logo") || lowerUrl.includes("nailhouse-logo")) {
      return ASSETS.logo;
    }
  }

  return url;
}
