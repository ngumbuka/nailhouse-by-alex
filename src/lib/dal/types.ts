import {
  MockProfile,
  MockBooking,
  MockGalleryImage,
  MockMessage,
  MockNotification,
  MockFavorite,
  MockSubscriber,
  MockService,
  MockReview,
  MockPromotion,
  MockSettings,
  MockVideo,
} from "../mock-db";

export interface DatabaseProvider {
  getMockUserRole: (userId: string, email?: string) => "admin" | "client";

  // Profiles
  getProfile: (userId: string, email?: string) => Promise<MockProfile>;
  updateProfile: (userId: string, data: Partial<MockProfile>) => Promise<MockProfile>;
  listProfiles: () => Promise<MockProfile[]>;

  // Bookings
  listBookings: () => Promise<MockBooking[]>;
  listBookingsForUser: (email: string) => Promise<MockBooking[]>;
  createBooking: (
    booking: Omit<MockBooking, "id" | "status" | "created_at">,
  ) => Promise<MockBooking>;
  updateBookingStatus: (
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
  ) => Promise<boolean>;
  updateBookingDetails: (
    id: string,
    updates: Partial<Omit<MockBooking, "id" | "created_at">>,
  ) => Promise<boolean>;

  // Services
  listServices: () => Promise<MockService[]>;
  addService: (service: Omit<MockService, "id"> & { id?: string }) => Promise<MockService>;
  updateService: (id: string, service: Partial<MockService>) => Promise<MockService | null>;
  deleteService: (id: string) => Promise<boolean>;

  // Gallery Images
  listGalleryImages: () => Promise<MockGalleryImage[]>;
  addGalleryImage: (url: string, caption?: string) => Promise<MockGalleryImage>;
  deleteGalleryImage: (id: string) => Promise<boolean>;

  // Favorites
  listFavorites: (userId: string) => Promise<MockFavorite[]>;
  addFavorite: (userId: string, serviceId: string) => Promise<MockFavorite>;
  removeFavorite: (userId: string, serviceId: string) => Promise<boolean>;

  // Messages
  listMessages: (userId: string) => Promise<MockMessage[]>;
  listAllMessagesForAdmin: () => Promise<MockMessage[]>;
  sendMessage: (senderId: string, receiverId: string, text: string) => Promise<MockMessage>;

  // Notifications
  listNotifications: (userId: string) => Promise<MockNotification[]>;
  markNotificationsAsRead: (userId: string) => Promise<boolean>;

  // Subscribers
  listSubscribers: () => Promise<MockSubscriber[]>;
  subscribeNewsletter: (email: string) => Promise<boolean>;

  // Reviews
  listReviewsForService: (serviceId: string) => Promise<MockReview[]>;
  createReview: (review: Omit<MockReview, "id" | "created_at">) => Promise<MockReview>;

  // Promotions
  listPromotions: () => Promise<MockPromotion[]>;
  createPromotion: (promo: Omit<MockPromotion, "id" | "created_at">) => Promise<MockPromotion>;
  deletePromotion: (id: string) => Promise<boolean>;
  getPromotionByCode: (code: string) => Promise<MockPromotion | null>;

  // Settings
  getSettings: () => Promise<MockSettings>;
  updateSettings: (settings: Partial<MockSettings>) => Promise<MockSettings>;

  // Videos
  listVideos: () => Promise<MockVideo[]>;
  addVideo: (video: Omit<MockVideo, "id" | "created_at">) => Promise<MockVideo>;
  updateVideo: (id: string, video: Partial<MockVideo>) => Promise<MockVideo | null>;
  deleteVideo: (id: string) => Promise<boolean>;
}
