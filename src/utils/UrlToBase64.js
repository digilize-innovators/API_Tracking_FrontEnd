import { BaseUrl } from "constants.js";

export const convertImageToBase64 = async (imageUrl, setImage) => {
  try {
    if (!imageUrl) return;
    const response = await fetch(BaseUrl + imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    }
    reader.onerror = error => {
      console.error('Error reading the image blob:', error);
    }
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error fetching the image:', error);
    setImage('/images/avatars/1.png');
  }
};
