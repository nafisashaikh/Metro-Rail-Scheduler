// Simple metro data for mock realtime service
export const metroLines = [
  {
    id: 'redline',
    name: 'Red Line',
    stations: [
      { id: 'miyapur', name: 'Miyapur' },
      { id: 'kphb', name: 'KPHB Colony' },
      { id: 'prakashnagar', name: 'Prakash Nagar' },
      { id: 'rasoolpura', name: 'Rasoolpura' },
      { id: 'begumpet', name: 'Begumpet' },
      { id: 'ameerpet', name: 'Ameerpet' },
      { id: 'nsgardens', name: 'Nampally' }
    ]
  },
  {
    id: 'greenline', 
    name: 'Green Line',
    stations: [
      { id: 'jubileehills', name: 'Jubilee Hills' },
      { id: 'madhapur', name: 'Madhapur' },
      { id: 'hitechcity', name: 'Hitech City' },
      { id: 'gachibowli', name: 'Gachibowli' },
      { id: 'masjid', name: 'Masjid Banda' }
    ]
  },
  {
    id: 'blueline',
    name: 'Blue Line', 
    stations: [
      { id: 'nagole', name: 'Nagole' },
      { id: 'uppal', name: 'Uppal' },
      { id: 'stadium', name: 'Stadium' },
      { id: 'gandhinagar', name: 'Gandhi Nagar' },
      { id: 'secunderabad', name: 'Secunderabad' }
    ]
  }
];

export interface Station {
  id: string;
  name: string;
}

export interface MetroLine {
  id: string;
  name: string;
  stations: Station[];
}

export interface TrainStatus {
  id: string;
  lineId: string;
  lineName: string;
  currentStationIndex: number;
  direction: 'forward' | 'reverse';
  delay: number;
  crowding: 'low' | 'medium' | 'high';
  lastUpdate: number;
}