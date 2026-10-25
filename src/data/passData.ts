export type PassType = 'AC' | 'Ordinary';
export type PassCategory = 'daily' | 'weekly' | 'monthly';

export interface PassInfo {
  id: string;
  name: string;
  type: PassType;
  category: PassCategory;
  totalFare: string;
  basePrice: string;
  gst: string;
  tollPrice?: string;
  convenienceFee: string;
  description: string;
  hasBottomNote?: boolean;
  noteText?: string;
  noteColor?: string;
  showInAll?: boolean;
}

export const passesData: PassInfo[] = [
  // Daily Passes
  {
    id: 'ordinary-day',
    name: 'Ordinary Day Pass',
    type: 'Ordinary',
    category: 'daily',
    totalFare: '₹ 80.0',
    basePrice: '₹ 80.0',
    gst: '₹ 0.0',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all Non-AC BMTC Buses throughout the calendar day (12:01 AM to 11:59 PM) and on toll roads by paying a toll fee (Excluding AC, Vayu Vajra - Airport Route, Bengaluru Rounds & Special Services). Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses.',
    showInAll: true
  },
  {
    id: 'vajra-gold-day',
    name: 'Vajra Gold Day Pass',
    type: 'AC',
    category: 'daily',
    totalFare: '₹140.0',
    basePrice: '₹ 133.33',
    gst: '₹ 6.67',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all AC & Non-AC BMTC Buses throughout the calendar day (12:01 AM to 11:59 PM) and on toll roads by paying a toll fee (Excluding Vayu Vajra - Airport Route, Bengaluru Rounds & Special Services). Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses.',
    hasBottomNote: true,
    noteText: 'This pass cannot be used for Airport Buses',
    noteColor: '#0EA3AB',
    showInAll: true
  },

  // Weekly Passes
  {
    id: 'ordinary-weekly',
    name: 'Ordinary Weekly Pass',
    type: 'Ordinary',
    category: 'weekly',
    totalFare: '₹ 350.0',
    basePrice: '₹ 350.0',
    gst: '₹ 0.0',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all Non-AC BMTC Buses throughout the 7 days (From the date of booking) and on toll roads by paying a toll fee (Excluding AC, Vayu Vajra - Airport Route, Bengaluru Rounds & Special Services.) Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses.',
    showInAll: true
  },
  // Monthly Passes
  {
    id: 'ordinary-monthly',
    name: 'Ordinary Service Monthly Pass',
    type: 'Ordinary',
    category: 'monthly',
    totalFare: '₹1200.0',
    basePrice: '₹ 1200.0',
    gst: '₹ 0.0',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all AC & Non-AC BMTC Buses throughout the Month (From the date of booking) and on toll roads by paying a toll fee (Excluding Vayu Vajra - Airport Route, Bengaluru Rounds & Special Services). Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses.',
    showInAll: true
  },
  {
    id: 'vajra-gold-monthly',
    name: 'Vajra Gold Monthly Pass',
    type: 'AC',
    category: 'monthly',
    totalFare: '₹2000.0',
    basePrice: '₹ 1904.76',
    gst: '₹ 95.24',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all AC & Non-AC BMTC Buses throughout the Month (From the date of booking) and on toll roads by paying a toll free (Excluding Vayu Vajra - Airport Route, Bengaluru Rounds & Special Services). Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses',
    hasBottomNote: true,
    noteText: 'This pass cannot be used for Airport Buses',
    noteColor: '#0EA3AB',
    showInAll: true
  },
  {
    id: 'vayu-vajra-gold',
    name: 'Vayu Vajra Gold Pass',
    type: 'AC',
    category: 'monthly',
    totalFare: '₹4100.0',
    basePrice: '₹ 3233.76',
    gst: '₹ 195.24',
    tollPrice: '₹ 671.0',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all AC, Vayu Vajra - Airport Route & Non-AC BMTC Buses throughout the Month (From the date of booking) and on toll roads by paying a toll fee except Navayuga toll fee (Excluding Bengaluru Rounds & Special Services.) Pass Holders will have to pay Rs 10 to board Ordinary or Vajra Express Buses.',
    hasBottomNote: true,
    noteText: 'Fare has been updated by BMTC as on 21st Sep 2025',
    noteColor: '#0EA3AB',
    showInAll: true
  },
  {
    id: 'nice-road-monthly',
    name: 'Nice Road Monthly Pass',
    type: 'Ordinary',
    category: 'monthly',
    totalFare: '₹2350.0',
    basePrice: '₹ 2350.0',
    gst: '₹ 0.0',
    convenienceFee: '₹ 0.0',
    description: 'You can travel in all Non-AC BMTC Buses throughout the Month (From the date of booking) and in all toll roads by paying toll fee except Nice Road toll. Pass Holders will have to pay Rs 10to board Ordinary or Vajra Express Buses.',
    showInAll: true
  },
  {
    id: 'express-monthly',
    name: 'Express Monthly Pass (Limited Stop)',
    type: 'Ordinary',
    category: 'monthly',
    totalFare: '₹1500.0',
    basePrice: '₹ 1500.0',
    gst: '₹ 0.0',
    convenienceFee: '₹ 0.0',
    description: 'The said "Pass holders can travel in BMTC express, ordinary, and NICE Road Ordinary services (excluding special services) during the pass validity period. it is mandatory to pay the applicable toll fee on toll roads.\n\nThe said pass holders are allowed to travel on Vajra and Express Vajra services by paying Rs. 30/- (GST inclusive) per single trip and applicable toll rates.',
    showInAll: true
  },
  {
    id: 'vajra-weekly',
    name: 'Vajra Weekly Pass',
    type: 'AC',
    category: 'weekly',
    totalFare: '₹ 700.0',
    basePrice: '₹ 666.67',
    gst: '₹ 33.33',
    convenienceFee: '₹ 0.0',
    description: 'Vajra weekly pass holders are allowed to travel unlimitedly on all Vajra, Ordinary Express, and Ordinary services (excluding VayuVajra & Special services.) it is mandatory to pay the applicable toll routes. While travelling on Vajra Express services, the express service fee of Rs. 10/- and the applicable toll charges should be paid. Vajra Weekly Pass holders are allowed to travel free in Ordinary (Non-AC) Express Services, but to travel via Vajra (AC) Express Services, they need to pay Rs 10 for every journey.',
    showInAll: true
  },
  {
    id: 'vajra-vistara-day',
    name: 'Vajra Vistara Daily Pass',
    type: 'AC',
    category: 'daily',
    totalFare: '₹180.0',
    basePrice: '₹ 171.43',
    gst: '₹ 8.57',
    convenienceFee: '₹ 0.0',
    description: 'The said pass holders are allowed to travel on all the services of the corporation (except Vayu Vajra and special services (e.g., Wonderla, Divya Darshan Tour Package, etc.)). It is mandatory to pay the applicable toll fee on toll roads. The said pass holders are allowed to travel in Vayu Vajra services by purchasing an applicable ticket along with the pass.',
    hasBottomNote: false,
    showInAll: true
  },
  {
    id: 'vajra-vistara-weekly',
    name: 'Vajra Vistara Weekly Pass',
    type: 'AC',
    category: 'weekly',
    totalFare: '₹1000.0',
    basePrice: '₹ 952.38',
    gst: '₹ 47.62',
    convenienceFee: '₹ 0.0',
    description: 'The said pass holders are allowed to travel on all the services of the corporation (except Vayu Vajra and special services (e.g., Wonderla, Divya Darshan Tour Package, etc.)). It is mandatory to pay the applicable toll fee on toll roads. The said pass holders are allowed to travel in Vayu Vajra services by purchasing an applicable ticket along with the pass.',
    hasBottomNote: false,
    showInAll: true
  },
  {
    id: 'vajra-vistara-monthly',
    name: 'Vajra Vistara Monthly Pass',
    type: 'AC',
    category: 'monthly',
    totalFare: '₹2700.0',
    basePrice: '₹ 2571.43',
    gst: '₹ 128.57',
    convenienceFee: '₹ 0.0',
    description: 'The said pass holders are allowed to travel on all the services of the corporation (except Vayu Vajra and special services (e.g., Wonderla, Divya Darshan Tour Package, etc.)). It is mandatory to pay the applicable toll fee on toll roads. The said pass holders are allowed to travel in Vayu Vajra services by purchasing an applicable ticket along with the pass.',
    hasBottomNote: false,
    showInAll: true
  }
];

export const getPassesByCategory = (category: 'all' | PassCategory) => {
  if (category === 'all') {
    return passesData.filter(pass => pass.showInAll);
  }
  return passesData.filter(pass => pass.category === category);
};
