export const upload = async (file) => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "Images"); 
    formData.append("cloud_name", "duamifqv6");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/duamifqv6/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    return data.secure_url; // this is the image link

  } catch (error) {
    console.log(error);
    return null;
  }
};

export default upload;