import axios from 'axios';

export function getTopPublicDatasets() {
    return axios.get('/api/pub/datasets/filter/views').then(
        (result) => {
            return result.data;
        }
    )
}