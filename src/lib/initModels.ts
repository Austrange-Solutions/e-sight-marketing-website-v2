/**
 * Model initialization utility to ensure all models are properly registered
 * This should be imported before using any models
 */

import { connect } from "@/dbConfig/dbConfig";

// Store initialization state
let isInitialized = false;

export async function initializeModels() {
  if (isInitialized) {
    return;
  }

  try {
    // Ensure database connection first
    await connect();
    
    // Import all models to register their schemas
    await Promise.all([
      import('@/models/userModel'),
      import('@/models/productModel'),
      import('@/models/cartModel'),
      import('@/models/orderModel'),
      import('@/models/UploadedImage'),
    ]);
    
    isInitialized = true;
    console.log('✅ All models initialized successfully');
  } catch (error) {
    console.error('❌ Model initialization failed:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
initializeModels().catch(console.error);