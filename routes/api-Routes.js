const router = require("express").Router();

//Conectar con DB
// La DB va a tener una tabla de página, cada página con un id y original_url.
// En la ruta, hacer validación de que la URL que me llega por POST es una URL válida.

// Cuando ingresan a /api/shorturl/:SHORT_URL  voy a tener que buscar SHORT_URL en la DB y redireccionar a esa original_url

// IS VALID URL:
function isValidURL(argumento) {
  if (typeof argumento !== "string") {
    return false;
  }
  return (
    argumento.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) !==
    null
  );
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

let idCounter = 0;
const temporaryDB = [];
let modelObj = {
  original_url: "",
  short_url: "",
};

router.post("/shorturl", (req, res) => {
  console.log(`Entré a "/api/shorturl"`);
  console.log(req.body);
  // console.log(req.query);
  // console.log(req.params);
  // console.log(req);
  try {
    const urlFromReq = req.body.url;
    console.log(urlFromReq);
    if (!validURL(urlFromReq)) {
      return res.status(400).send({ error: "invalid url" });
    }

    idCounter++;
    let newURL = {
      original_url: urlFromReq,
      short_url: idCounter,
    };

    temporaryDB.push(newURL);

    return res
      .status(200)
      .send({ original_url: urlFromReq, short_url: newURL.short_url });
  } catch (error) {
    console.log(`Error en /api/shorturl. ${error.message}`);
    return res.status(400).send({ error: error.message });
  }
});

router.get("/shorturl/:shortURL", (req, res) => {
  console.log(`Entré a /shorturl/:shortURL`);
  try {
    let shortURL = req.params.shortURL;
    console.log(shortURL);

    let originalURL = temporaryDB.find((obj) => obj.short_url == shortURL);
    if (!originalURL) {
      return res.status(404).send({
        error: "Sorry, that Short URL code doesn't exists in the DB.",
      });
    }
    return res.redirect(originalURL.original_url);
  } catch (error) {
    console.log(`Error en /:shortURL. ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
