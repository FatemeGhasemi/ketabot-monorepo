const axios = require('axios');

//TODO remove this function , I think we Don't need it anymore
const createBook = async (data) => {
    try {
        const url = process.env.BASE_URL + "/books"
        const result = await axios({
            method: 'POST',
            url: url,
            headers: {
                "content-Type": "application/json",
                "admin-token": process.env.ADMIN_CODE
            },
            data: {
                title: data.title,
                path: data.path,
                cost: data.cost,
                description: data.description,
                publisher: data.publisher,
                author: data.author,
                publishedYear: data.publishedYear,
                translator: data.translator,
                voiceActor: data.voiceActor,
                category: data.category,
                tags: data.tags,
                language: data.language,
                downloadCount: data.downloadCount,
                type: data.type,
                cover: data.cover,
                parts: data.parts,
                sourceLink: data.sourceLink,
                isActive: data.isActive
            }
        });
        return result.data
    } catch (e) {
        console.log("ERROR AXIOS: ", e)
    }
};

const findBookByCategory = async (category, begin = 0, total=11 ) => {
    try {
        console.log("hii findBookByCategory",{category,begin,total})
      const result = await axios({
            method: 'GET',
            url: process.env.BASE_URL + '/books',
            params: {
                category: category,
                begin,
                total:total
            }
        });
      console.log("result.data findBookByCategory>>>",result.data)
        return result.data
    } catch (e) {
        console.log("findBookByCategory ERROR: ", e.message)
    }

};


const findBookByTitle = async (title) => {
    const result = await axios({
        method: 'GET',
        url: process.env.BASE_URL + '/books',
        params: {
            title: title
        }
    });
    return result.data
};


const findBookByDetails = async (details, begin = 0, total = 10) => {
    try {
      const result = await axios({
            method: 'GET',
            url: process.env.BASE_URL + '/books',
            params: {
                details: details,
                begin, total
            }
        });
        return result.data
    }catch (e) {
        console.log("findBookByDetails ERROR: ",e.message)
    }
};


const findBookById = async (bookId) => {
    const result = await axios({
        method: 'GET',
        url: process.env.BASE_URL + '/books',
        params: {
           bookId,
        }
    });
    return result.data
};


module.exports = {findBookByCategory, findBookByDetails, findBookById, findBookByTitle, createBook}