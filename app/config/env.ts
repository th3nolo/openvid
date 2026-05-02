export const env = {
    unsplash: {
        accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? "",
    },
    pexels: {
        apiKey: process.env.NEXT_PUBLIC_PEXELS_API_KEY ?? "",
    },
    pixabay: {
        apiKey: process.env.NEXT_PUBLIC_PIXABAY_API_KEY ?? "",
    },
} as const;
