import { connect } from "@/dbConfig/dbConfig";
import DeliveryArea from "@/models/deliveryAreaModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";

// Mumbai Suburban Pincodes from your CSV
const MUMBAI_SUBURBAN_AREAS = [
  { pincode: "400029", areaName: "A I staff colony", district: "Mumbai Suburban" },
  { pincode: "400036", areaName: "A. K. Marg", district: "Mumbai Suburban" },
  { pincode: "400065", areaName: "Aareymilk Colony", district: "Mumbai Suburban" },
  { pincode: "421506", areaName: "Additional Ambernath", district: "Thane" },
  { pincode: "421301", areaName: "Aghai", district: "Thane" },
  { pincode: "400011", areaName: "Agripada", district: "Mumbai City" },
  { pincode: "400708", areaName: "Airoli", district: "Thane" },
  { pincode: "400099", areaName: "Airport", district: "Mumbai Suburban" },
  { pincode: "402201", areaName: "Alibag", district: "Raigad" },
  { pincode: "421601", areaName: "Alyani", district: "Thane" },
  { pincode: "421501", areaName: "Ambernath", district: "Thane" },
  { pincode: "400004", areaName: "Ambewadi", district: "Mumbai City" },
  { pincode: "400053", areaName: "Andheri", district: "Mumbai Suburban" },
  { pincode: "400069", areaName: "Andheri East", district: "Mumbai Suburban" },
  { pincode: "400058", areaName: "Andheri Railway station", district: "Mumbai Suburban" },
  { pincode: "400037", areaName: "Antop Hill", district: "Mumbai City" },
  { pincode: "400610", areaName: "Apna Bazar", district: "Thane" },
  { pincode: "421102", areaName: "Atali", district: "Thane" },
  { pincode: "400005", areaName: "Asvini", district: "Mumbai City" },
  { pincode: "400090", areaName: "Bangur Nagar", district: "Mumbai Suburban" },
  { pincode: "400001", areaName: "Bazargate", district: "Mumbai City" },
  { pincode: "400614", areaName: "Belapur Node- v", district: "Thane" },
  { pincode: "400012", areaName: "Best Staff colony", district: "Mumbai City" },
  { pincode: "421002", areaName: "Bhaji Market", district: "Thane" },
  { pincode: "400007", areaName: "Bharat Nagar", district: "Mumbai City" },
  { pincode: "421603", areaName: "Bhatsanagar", district: "Thane" },
  { pincode: "400028", areaName: "Bhawani Shankar", district: "Mumbai City" },
  { pincode: "401105", areaName: "Bhayander East", district: "Thane" },
  { pincode: "401101", areaName: "Bhayander West", district: "Thane" },
  { pincode: "421308", areaName: "Bhiwandi", district: "Thane" },
  { pincode: "400091", areaName: "Borivali", district: "Mumbai Suburban" },
  { pincode: "400066", areaName: "Borivali East", district: "Mumbai Suburban" },
  { pincode: "400092", areaName: "Borvali West", district: "Mumbai Suburban" },
  { pincode: "421001", areaName: "Bus Terminus", district: "Thane" },
  { pincode: "400013", areaName: "C G s colony", district: "Mumbai City" },
  { pincode: "400020", areaName: "Central Building", district: "Mumbai City" },
  { pincode: "400030", areaName: "Century Mill", district: "Mumbai City" },
  { pincode: "400093", areaName: "Chakala Midc", district: "Mumbai Suburban" },
  { pincode: "400067", areaName: "Charkop", district: "Mumbai Suburban" },
  { pincode: "400009", areaName: "Chinch B'der", district: "Mumbai City" },
  { pincode: "400607", areaName: "Chitalsar Manpada", district: "Thane" },
  { pincode: "400026", areaName: "Cumbala Hill", district: "Mumbai City" },
  { pincode: "400014", areaName: "Dadar", district: "Mumbai City" },
  { pincode: "400612", areaName: "Dahisar", district: "Mumbai Suburban" },
  { pincode: "400068", areaName: "Dahisar Rs", district: "Mumbai Suburban" },
  { pincode: "400052", areaName: "Danda", district: "Mumbai Suburban" },
  { pincode: "421302", areaName: "Dandekarwadi", district: "Thane" },
  { pincode: "400706", areaName: "Darave", district: "Thane" },
  { pincode: "400017", areaName: "Dharavi", district: "Mumbai City" },
  { pincode: "421402", areaName: "Dhasai", district: "Thane" },
  { pincode: "400010", areaName: "Dockyard Road", district: "Mumbai City" },
  { pincode: "421201", areaName: "Dombivali", district: "Thane" },
  { pincode: "421203", areaName: "Dombivali I.a.", district: "Thane" },
  { pincode: "400008", areaName: "Falkland Road", district: "Mumbai City" },
  { pincode: "400023", areaName: "Fort", district: "Mumbai City" },
  { pincode: "401206", areaName: "Ganeshpuri", district: "Thane" },
  { pincode: "421306", areaName: "Ganeshwadi", district: "Thane" },
  { pincode: "421403", areaName: "Gegaon", district: "Thane" },
  { pincode: "400701", areaName: "Ghansoli", district: "Thane" },
  { pincode: "400602", areaName: "Gokhale Road", district: "Thane" },
  { pincode: "400062", areaName: "Goregaon", district: "Mumbai Suburban" },
  { pincode: "400063", areaName: "Goregaon East", district: "Mumbai Suburban" },
  { pincode: "400051", areaName: "Government Colony", district: "Mumbai Suburban" },
  { pincode: "400034", areaName: "Hajiali", district: "Mumbai City" },
  { pincode: "400057", areaName: "Hanuman Road", district: "Mumbai Suburban" },
  { pincode: "400032", areaName: "High Court bulding", district: "Mumbai City" },
  { pincode: "400095", areaName: "Ins Hamla", district: "Mumbai Suburban" },
  { pincode: "400056", areaName: "Irla", district: "Mumbai Suburban" },
  { pincode: "400059", areaName: "J.B. nagar", district: "Mumbai Suburban" },
  { pincode: "400606", areaName: "Jekegram", district: "Thane" },
  { pincode: "400027", areaName: "Jijamata Udyan", district: "Mumbai City" },
  { pincode: "400060", areaName: "Jogeshwari East", district: "Mumbai Suburban" },
  { pincode: "400102", areaName: "Jogeshwari West", district: "Mumbai Suburban" },
  { pincode: "400049", areaName: "Juhu", district: "Mumbai Suburban" },
  { pincode: "400703", areaName: "K.U.bazar", district: "Thane" },
  { pincode: "400033", areaName: "Kalachowki", district: "Mumbai City" },
  { pincode: "400002", areaName: "Kalbadevi", district: "Mumbai City" },
  { pincode: "400605", areaName: "Kalwa", district: "Thane" },
  { pincode: "400101", areaName: "Kandivali East", district: "Mumbai Suburban" },
  { pincode: "400016", areaName: "Kapad Bazar", district: "Mumbai City" },
  { pincode: "410201", areaName: "Karjat", district: "Raigad" },
  { pincode: "421602", areaName: "Kasara", district: "Thane" },
  { pincode: "400601", areaName: "Kasarvadavali", district: "Thane" },
  { pincode: "421401", areaName: "Kasegaon", district: "Thane" },
  { pincode: "421204", areaName: "Katemanivali", district: "Thane" },
  { pincode: "410202", areaName: "Khallapur", district: "Raigad" },
  { pincode: "421311", areaName: "Kon", district: "Thane" },
  { pincode: "400709", areaName: "Kopar Khairne", district: "Thane" },
  { pincode: "400603", areaName: "Kopri Colony", district: "Thane" },
  { pincode: "421312", areaName: "Kudus", district: "Thane" },
  { pincode: "421503", areaName: "Kulgaon", district: "Thane" },
  { pincode: "400061", areaName: "Madh", district: "Mumbai Suburban" },
  { pincode: "402301", areaName: "Mahad", district: "Raigad" },
  { pincode: "400006", areaName: "Malabar Hill", district: "Mumbai City" },
  { pincode: "400064", areaName: "Malad", district: "Mumbai Suburban" },
  { pincode: "400097", areaName: "Malad East", district: "Mumbai Suburban" },
  { pincode: "400103", areaName: "Mandapeshwar", district: "Mumbai Suburban" },
  { pincode: "400003", areaName: "Mandvi", district: "Mumbai City" },
  { pincode: "402104", areaName: "Mangaon", district: "Raigad" },
  { pincode: "421102", areaName: "Manivail", district: "Thane" },
  { pincode: "400019", areaName: "Matunga", district: "Mumbai City" },
  { pincode: "402105", areaName: "Mhasala", district: "Raigad" },
  { pincode: "400710", areaName: "Millenium Business park", district: "Thane" },
  { pincode: "401104", areaName: "Mira", district: "Thane" },
  { pincode: "401107", areaName: "Mira Road", district: "Thane" },
  { pincode: "421102", areaName: "Mohone", district: "Thane" },
  { pincode: "400104", areaName: "Motilal Nagar", district: "Mumbai Suburban" },
  { pincode: "402401", areaName: "Murud", district: "Raigad" },
  { pincode: "421401", areaName: "Murbad", district: "Thane" },
  { pincode: "400021", areaName: "Nariman Point", district: "Mumbai City" },
  { pincode: "400024", areaName: "Nehru Nagar", district: "Mumbai City" },
  { pincode: "421505", areaName: "Netaji Bazar", district: "Thane" },
  { pincode: "400025", areaName: "New Prabhadevi road", district: "Mumbai City" },
  { pincode: "421502", areaName: "O.E.ambernath", district: "Thane" },
  { pincode: "421101", areaName: "Padgha", district: "Thane" },
  { pincode: "410206", areaName: "Panvel", district: "Raigad" },
  { pincode: "402107", areaName: "Pen", district: "Raigad" },
  { pincode: "402303", areaName: "Poladpur", district: "Raigad" },
  { pincode: "400035", areaName: "Rajbhavan", district: "Mumbai City" },
  { pincode: "402109", areaName: "Roha", district: "Raigad" },
  { pincode: "400705", areaName: "Sanpada", district: "Thane" },
  { pincode: "400054", areaName: "Santacruz Central", district: "Mumbai Suburban" },
  { pincode: "400055", areaName: "Santacruz(east)", district: "Mumbai Suburban" },
  { pincode: "400096", areaName: "Seepz", district: "Mumbai Suburban" },
  { pincode: "400015", areaName: "Sewree", district: "Mumbai City" },
  { pincode: "421103", areaName: "Shahad", district: "Thane" },
  { pincode: "400022", areaName: "Sion", district: "Mumbai City" },
  { pincode: "421002", areaName: "Station Road unr-3", district: "Thane" },
  { pincode: "410205", areaName: "Sudhagad-Pali", district: "Raigad" },
  { pincode: "402111", areaName: "Tala", district: "Raigad" },
  { pincode: "400601", areaName: "Thane", district: "Thane" },
  { pincode: "421605", areaName: "Titwala", district: "Thane" },
  { pincode: "421004", areaName: "Ulhasnagar-4", district: "Thane" },
  { pincode: "421005", areaName: "Ulhasnagar-5", district: "Thane" },
  { pincode: "400702", areaName: "Uran", district: "Raigad" },
  { pincode: "401106", areaName: "Uttan", district: "Thane" },
  { pincode: "401204", areaName: "Vajreshwari", district: "Thane" },
  { pincode: "400703", areaName: "Vashi", district: "Thane" },
  { pincode: "421604", areaName: "Vashind", district: "Thane" },
  { pincode: "400098", areaName: "Vidyanagari", district: "Mumbai Suburban" },
  { pincode: "421305", areaName: "Vidyashram", district: "Thane" },
  { pincode: "421202", areaName: "Vishnunagar", district: "Thane" },
  { pincode: "400031", areaName: "Wadala", district: "Mumbai City" },
  { pincode: "400604", areaName: "Wagle I.e.", district: "Thane" },
  { pincode: "400018", areaName: "Worli", district: "Mumbai City" }
];

// POST: Bulk import Mumbai suburban pincodes
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const area of MUMBAI_SUBURBAN_AREAS) {
      try {
        // Check if pincode already exists
        const existingArea = await DeliveryArea.findOne({ pincode: area.pincode });
        
        if (existingArea) {
          skipped++;
          continue;
        }

        // Create new delivery area
        const newArea = new DeliveryArea({
          pincode: area.pincode,
          areaName: area.areaName,
          district: area.district,
          deliveryCharges: 100, // Standard charges for Mumbai suburban
          isActive: true
        });

        await newArea.save();
        imported++;
      } catch (error) {
        errors.push(`Error importing ${area.pincode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed`,
      summary: {
        totalProcessed: MUMBAI_SUBURBAN_AREAS.length,
        imported,
        skipped,
        errors: errors.length
      },
      errors
    });
  } catch (error: unknown) {
    console.error('Bulk import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error during bulk import';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
