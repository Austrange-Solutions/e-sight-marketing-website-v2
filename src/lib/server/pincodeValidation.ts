import { connect } from "@/dbConfig/dbConfig";
import DeliveryArea from "@/models/deliveryAreaModel";
import AdminSettings from "@/models/adminSettingsModel";

export interface PincodeValidationResult {
  isValid: boolean;
  exists: boolean;
  deliveryCharges: number;
  area: {
    pincode: string;
    areaName: string;
    district: string;
    deliveryCharges: number;
  } | null;
  validationErrors: string[];
  appliedRule: 'EXACT_MATCH' | 'DEFAULT_CHARGES' | 'FREE_DELIVERY';
}

export class PincodeValidationService {
  private static async getAdminSettings() {
    try {
      const settings = await AdminSettings.find({ isActive: true });
      return settings.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {} as Record<string, string | number | boolean>);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      // Return default settings if database fails
      return {
        DEFAULT_DELIVERY_CHARGES: 500,
        MUMBAI_SUBURBAN_CHARGES: 100,
        PINCODE_VALIDATION_STRICT: true,
        PINCODE_LENGTH_VALIDATION: 6,
        FREE_DELIVERY_THRESHOLD: 2000
      };
    }
  }

  public static async validatePincode(
    pincode: string, 
    orderAmount: number = 0
  ): Promise<PincodeValidationResult> {
    try {
      await connect();
      
      const settings = await this.getAdminSettings();
      const validationErrors: string[] = [];
      
      // Clean and normalize pincode
      const cleanPincode = pincode.toString().trim();
      
      // Strict validation based on admin settings
      const requiredLength = settings.PINCODE_LENGTH_VALIDATION || 6;
      const strictValidation = settings.PINCODE_VALIDATION_STRICT !== false;
      
      // Length validation
      if (cleanPincode.length !== requiredLength) {
        validationErrors.push(`Pincode must be exactly ${requiredLength} digits`);
      }
      
      // Digit-only validation
      if (!/^\d+$/.test(cleanPincode)) {
        validationErrors.push("Pincode must contain only numbers");
      }
      
      // Strict format validation (6 digits exactly)
      if (strictValidation && !/^\d{6}$/.test(cleanPincode)) {
        validationErrors.push("Invalid pincode format. Must be exactly 6 digits (000000-999999)");
      }
      
      // If validation fails, return default charges
      if (validationErrors.length > 0) {
        return {
          isValid: false,
          exists: false,
          deliveryCharges: settings.DEFAULT_DELIVERY_CHARGES || 500,
          area: null,
          validationErrors,
          appliedRule: 'DEFAULT_CHARGES'
        };
      }
      
      // Exact pincode match - character by character
      const area = await DeliveryArea.findOne({ 
        pincode: { $eq: cleanPincode }, // Exact match using $eq operator
        isActive: true 
      });
      
      if (area) {
        // Check for free delivery threshold
        const freeDeliveryThreshold = settings.FREE_DELIVERY_THRESHOLD || 2000;
        const finalCharges = orderAmount >= freeDeliveryThreshold ? 0 : area.deliveryCharges;
        
        return {
          isValid: true,
          exists: true,
          deliveryCharges: finalCharges,
          area: {
            pincode: area.pincode,
            areaName: area.areaName,
            district: area.district,
            deliveryCharges: area.deliveryCharges
          },
          validationErrors: [],
          appliedRule: finalCharges === 0 ? 'FREE_DELIVERY' : 'EXACT_MATCH'
        };
      }
      
      // No exact match found, apply default charges
      return {
        isValid: true, // Pincode format is valid
        exists: false, // But not in our delivery database
        deliveryCharges: settings.DEFAULT_DELIVERY_CHARGES || 500,
        area: null,
        validationErrors: [],
        appliedRule: 'DEFAULT_CHARGES'
      };
      
    } catch (error) {
      console.error("Error in pincode validation:", error);
      return {
        isValid: false,
        exists: false,
        deliveryCharges: 500, // Fallback charges
        area: null,
        validationErrors: ["System error during validation"],
        appliedRule: 'DEFAULT_CHARGES'
      };
    }
  }

  public static async validateMultiplePincodes(
    pincodes: string[], 
    orderAmount: number = 0
  ): Promise<Record<string, PincodeValidationResult>> {
    const results: Record<string, PincodeValidationResult> = {};
    
    for (const pincode of pincodes) {
      results[pincode] = await this.validatePincode(pincode, orderAmount);
    }
    
    return results;
  }
}

export default PincodeValidationService;
