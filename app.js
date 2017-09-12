const fs = require('fs'),
    xml2js = require('xml2js'),
    readFilePromise = require('fs-readfile-promise');


const IMPORT_FILE = './in_xml/import.xml';
const OFFER_FILE = './in_xml/offers.xml';
const testFile = './in_xml/small.xml';

const resFile = './out_json/res.json';

const import_json = './out_json/import.json';
const offer_json = './out_json/offer.json';

const zeroprice = './out_json/zeroprice.json';


process(); // Run

const options = {
    explicitArray : false,
    ignoreAttrs   : true,
};

let parser = new xml2js.Parser(options);

async function process() {
    let importFileData = await readFile(IMPORT_FILE);
    let offerFileData = await readFile(OFFER_FILE);

    console.log('IMPORT_FILE ', importFileData.length);
    console.log('OFFER_FILE ', offerFileData.length);

    let importFileData_obj = await XML2JS(importFileData);
    let offerFileData_obj = await XML2JS(offerFileData);

    console.log('IMPORT_FILE OBJ ', JSON.stringify(importFileData_obj).length);
    console.log('OFFER_FILE OBJ', JSON.stringify(offerFileData_obj).length);

    let selectedData = selectData(importFileData_obj, offerFileData_obj);

    let productList = buildProdList(
        selectedData.products,
        selectedData.terms,
        selectedData.category,
        selectedData.offers
    );

    productList = filter_WITHimages(productList);
    productList = filter_NONzeroprice(productList);
    console.log(productList);

    // saveFile(offer_json, JSON.stringify(offerFileData_obj));
    saveFile(resFile, JSON.stringify(productList));

    saveFile(zeroprice, JSON.stringify(filter_zeroprice(productList)));

}


function selectData(importFileData, offerFilata) {
    return {
        products : importFileData.КоммерческаяИнформация.Каталог.Товары.Товар, // .slice(0, 50),
        terms    : importFileData.КоммерческаяИнформация.Классификатор.Свойства.Свойство,
        category : importFileData.КоммерческаяИнформация.Классификатор.Категории.Категория,
        offers   : offerFilata.КоммерческаяИнформация.ПакетПредложений.Предложения.Предложение,
    };
}

function saveFile(file, data) {
    fs.writeFileSync(file, data)
}


function buildProdList(products, terms, category, offers) {

    let productList = products.map(el => {

        let attrtibutes = el.ЗначенияСвойств.ЗначенияСвойства;
        // console.log('attrtibutes ', attrtibutes);

        let attr = {};

        for (let el of attrtibutes) {
            let propName = getProperty(terms, el.Ид).toLowerCase();
            let propValue = getValue(terms, el.Ид, el.Значение);
            attr[propName] = propValue;
        }

        // console.log('ATTR: ', attr);
        // console.log('Compound attr: ', attr);
        // console.log('ELement', el);

        return {
            sku      : el.Артикул,
            title    : el.Наименование,
            img      : el.hasOwnProperty('Картинка') ? 'public://' + el.Картинка : null,
            category : getProperty(category, el.Категория),
            price    : +getPrice(offers, el.Ид),
            ...attr,
        }

    });

    // console.log('New Arr ', productList);
    return productList;
}

// Look term in voc
function getProperty(voc, term) {
    return voc.find(el => el.Ид === term).Наименование
}

function getValue(voc, term, val) {
    // console.log('MATCH ', val.toString().match(/-/gi).length, typeof val);

    let match = val.match(/-/gi);

    if (Array.isArray(match) && match.length === 4) {
        // console.log('TERM  ', term);
        // console.log('VAL ', val);
        // console.log('VOC ', voc);
        let vocBook = voc.find(el => el.Ид === term).ВариантыЗначений.Справочник;
        // console.log('Voc book ', vocBook);
        let valBook = Array.isArray(vocBook) ? vocBook.find(el => el.ИдЗначения === val).Значение : vocBook.Значение;
        // console.log('Val Book', valBook);
        return valBook;
        // let bookTerm = vocBook.find(el => el.ИдЗначения === term);

        // return bookTerm
    } else {
        return val;
    }
}

function getPrice(offers, id) {
    let obj = offers.find(el => el.Ид === id);
    if (obj == null) return 0;
    return obj.Цены.Цена.ЦенаЗаЕдиницу;
}

async function readFile(file) {
    return await readFilePromise(file)
        .then(buffer => buffer.toString())
        .catch(err => console.error(err.message));
}

function XML2JS(data) {
    return new Promise((resolve, reject) => {
            parser.parseString(data, (err, result) => {
                if (!err) {
                    resolve(result)
                }
            });
        }
    );
}

function filter_NONzeroprice(productList) {
    return productList.filter(el => el.price !== 0);
}

function filter_WITHimages(productList) {
    return productList.filter(el => el.img !== null);
}

function filter_zeroprice(productList) {
    return productList.filter(el => el.price === 0).sort((a, b) => a.sku.localeCompare(b.sku));
}