import axios from 'axios';
import shortid from 'shortid';

export function getAllProjects() {
    return axios.get('/api/v2/projects', {
        params: {
            //apikey: '472abe203cd411e3a280ac162d80f1bf'
            apikey: 'dbb4d7a2a0b511e383a2ac162d80f1bf'
            //simple: true
        }
    }).then((projects) => projects.data.map(p => {
        p.birthtime = new Date(p.birthtime * 1000);
        p.mtime = new Date(p.mtime * 1000);
        p.reminders = p.reminders.map(r => {
            r.id = shortid.generate();
            return r;
        });
        return p;
    }));
}