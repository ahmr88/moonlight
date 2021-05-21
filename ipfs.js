import axios from "axios";

const config = {}

const getContentsByUrl = (url) => async (dirHash) => {
  // const path = `${url}/ls?${dirHash}`
  const path = `${url}/ls?arg=${dirHash}`
  try {
    const res = await axios.post(path)
    return res.data.Objects
  } catch (e) {
  }
  // return res.data
}

const list = (dirHash) => {
  return findFiles([dirHash])
}

export default (config) => {
  const getContents = getContentsByUrl(config.url)

  const findFiles = async (dirs) => {
    return getContents(dirs)
  }

  return findFiles
}
