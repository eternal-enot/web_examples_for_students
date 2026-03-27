export type DogApiStatus = "success" | "error";

export interface BreedListResponse {
  message: Record<string, string[]>;
  status: DogApiStatus;
}

export interface DogImageResponse {
  message: string;
  status: DogApiStatus;
}
