import axios from "axios";
import post from './clickup.js'
import list from './ipfs.js'
import fs from "fs"

const out = list({
  url: 'http://127.0.0.1:5001/api/v0' 
})

// out('QmdTCMG4ZasSbULH5RWFhaTY8J8FUYZWbPCd7sWUMqx2aT').then(console.log)
out('QmakQDDH53tQkpntaZW7US8DYuFjUse3ipyQfKMNcbzKFD').then(console.log)
