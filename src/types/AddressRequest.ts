export interface AddressRequest {
  apartmentNumber?: string;
  floor?: string;
  building?: string;
  streetNumber?: string;
  street?: string;
  city: string;
  country: string;
  addressType?: number;
}
