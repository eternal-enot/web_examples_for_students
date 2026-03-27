const API_BASE_URL = "https://dog.ceo/api";
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}
export async function getBreeds() {
    const data = await fetchJson(`${API_BASE_URL}/breeds/list/all`);
    return Object.keys(data.message).sort();
}
export async function getDogImageByBreed(breed) {
    const data = await fetchJson(`${API_BASE_URL}/breed/${breed}/images/random`);
    return data.message;
}
