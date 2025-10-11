export type ReviewDoc = {
  _id: string;
  companyId: string;
  comment: string;             
  rating: number;               
  major?: string;
  author?: string;
  createdAt: string;            
};

export type Company = {
  _id: string;
  name: string;
  booth?: {
    _id: string;
    fairId?: string;
    building: string;
    floor: "G" | "1" | "2";
    room?: string;
    number?: string;
  };
};
