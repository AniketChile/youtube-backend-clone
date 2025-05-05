import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const configureCloudinary = async () => {
    await cloudinary.config({
        cloud_name: "aniketchile5", 
        api_key: "699836181921913", 
        api_secret: "6mBWcF1OkxBKg0-dzlIV7DstOsc"
    });
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded successfully on Cloudinary", response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

// Ensure Cloudinary is configured before trying to upload
configureCloudinary().then(() => {
    console.log("Cloudinary configured successfully");
}).catch(err => {
    console.error("Cloudinary configuration failed", err);
});



export {uploadOnCloudinary}