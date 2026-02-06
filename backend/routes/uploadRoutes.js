const router = require("express").Router();
const { upload, cloudinary } = require("../config/cloudinary");

// Upload single image
router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        console.log("[UPLOAD] Image uploaded successfully:", req.file.path);

        res.json({
            success: true,
            url: req.file.path,
            public_id: req.file.filename,
        });
    } catch (err) {
        console.error("[UPLOAD] Error uploading image:", err);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

// Delete image by public_id
router.delete("/:publicId", async (req, res) => {
    try {
        const result = await cloudinary.uploader.destroy(req.params.publicId);
        console.log("[UPLOAD] Image deleted:", req.params.publicId);
        res.json({ success: true, result });
    } catch (err) {
        console.error("[UPLOAD] Error deleting image:", err);
        res.status(500).json({ error: "Failed to delete image" });
    }
});

module.exports = router;
