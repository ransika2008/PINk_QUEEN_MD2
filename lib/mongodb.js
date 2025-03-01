const mongoose = require('mongoose');
const config = require('../config');
const EnvVar = require('./mongodbenv');

// Default environment variables
const defaultEnvVariables = [
    { key: 'ALIVE_IMG', value: 'https://raw.githubusercontent.com/ransika2008/Img-2/refs/heads/main/Futuristic%20sci-fi%20silhouetted%203D%20text%20design%20PINK%20QUEEN%20MD%20and%20I.am%20Alive%2' },
    { key: 'ALIVE_MSG', value: 'Hello, I am alive now!!\n\n🥶𝐌𝐚𝐝𝐞 𝐛𝐲 CHAMINDU🥶' },
    { key: 'PREFIX', value: '.' },
    { key: 'AUTO_READ_STATUS', value: 'true' }, // Fixed the typo
    { key: 'GEMINI_API_KEY', value: 'AIzaSyAaUZj6tqNuWIvCOBdDWdejOkdo_-vKQlo' },
    { key: 'MOVIE_API_KEY', value: 'sky|03cf4b3a363187ce93fe1438a7246ddc9574dd19' },
];

// MongoDB connection function
const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('🛜 MongoDB Connected ✅');

        // Check and create default environment variables if they do not exist
        for (const envVar of defaultEnvVariables) {
            const existingVar = await EnvVar.findOne({ key: envVar.key });

            if (!existingVar) {
                // Create a new environment variable with the default value
                await EnvVar.create(envVar);
                console.log(`➕ Created default env var: ${envVar.key}`);
            }
        }

    } catch (err) {
        console.error('MongoDB Connection Error: ', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
