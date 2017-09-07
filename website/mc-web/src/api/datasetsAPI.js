import axios from 'axios';

export function getTopPublicDatasets() {
    return axios.get('/api/pub/datasets/filter/views').then(
        (result) => {
            console.log(result);
            return result.data;
        }
    )
}