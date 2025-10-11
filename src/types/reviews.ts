export type ReviewDoc = {
  _id: string;
  companyId: string;
  comment: string;             
  rating: number;               
  major?: string;
  createdAt: string;            
};

