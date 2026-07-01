// CDN URLs for salon imagery (uploaded via lovable-assets).
import logo from "@/assets/logo.jpg.asset.json";
import burgundyManicure from "@/assets/burgundy-manicure.jpg.asset.json";
import polkaDotNails from "@/assets/polka-dot-nails.jpg.asset.json";
import salonPedicure from "@/assets/salon-pedicure.jpg.asset.json";
import mindfulCandle from "@/assets/mindful-candle.jpg.asset.json";
import workstation from "@/assets/workstation.jpg.asset.json";
import ledLamp from "@/assets/led-lamp.jpg.asset.json";
import polishShelves from "@/assets/polish-shelves.jpg.asset.json";
import basketsCorner from "@/assets/baskets-corner.jpg.asset.json";
import barShelf from "@/assets/bar-shelf.jpg.asset.json";
import coffeeEasel from "@/assets/coffee-easel.jpg.asset.json";
import heroManicure from "@/assets/hero-manicure.jpg.asset.json";
import heroServicesV2 from "@/assets/hero-services-v2.jpg.asset.json";
import heroAboutV2 from "@/assets/hero-about-v2.jpg.asset.json";
import heroContactImg from "@/assets/hero-contact.jpg.asset.json";
import heroTarifsImg from "@/assets/hero-tarifs.jpg.asset.json";
import heroLoop from "@/assets/hero-loop.mp4.asset.json";
import gestureLoop from "@/assets/gesture-loop.mp4.asset.json";

export const ASSETS = {
  logo: logo.url,
  burgundyManicure: burgundyManicure.url,
  polkaDotNails: polkaDotNails.url,
  salonPedicure: salonPedicure.url,
  mindfulCandle: mindfulCandle.url,
  workstation: workstation.url,
  ledLamp: ledLamp.url,
  polishShelves: polishShelves.url,
  basketsCorner: basketsCorner.url,
  barShelf: barShelf.url,
  coffeeEasel: coffeeEasel.url,
  heroManicure: heroManicure.url,
  heroServices: heroServicesV2.url,
  heroTarifs: heroTarifsImg.url,
  heroAbout: heroAboutV2.url,
  heroContact: heroContactImg.url,
  heroLoopVideo: heroLoop.url,
  gestureLoopVideo: gestureLoop.url,
} as const;
