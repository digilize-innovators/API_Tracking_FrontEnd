import { BaseUrl } from "constants.js";

export const convertImageToBase64 = async (imageUrl, setImage) => {
  try {
    if (!imageUrl) return null;

    const response = await fetch(BaseUrl + imageUrl);
    const blob = await response.blob();

    // Wrap FileReader in a Promise
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // If setImage is provided, call it, otherwise return the base64
    if (setImage) {
      setImage(base64);
    } else {
      return base64;
    }

  } catch (error) {
    console.error('Error fetching the image:', error);
    if (setImage) setImage('/images/avatars/1.png');
    else return '/images/avatars/1.png';
  }
};

