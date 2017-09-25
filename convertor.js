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
const noimages = './out_json/noimages.json';

process(); // Run

const parserOptions = {
    explicitArray : false,
    ignoreAttrs   : true,
};

let parser = new xml2js.Parser(parserOptions);

async function process() {
    let importFileData = await readFile(IMPORT_FILE);
    let offerFileData = await readFile(OFFER_FILE);

    let importFileData_obj = await XML2JS(importFileData);
    let offerFileData_obj = await XML2JS(offerFileData);

    let selectedData = selectData(importFileData_obj, offerFileData_obj);

    let productList = buildProductList(
        selectedData.products,
        selectedData.terms,
        selectedData.category,
        selectedData.offers
    );

    // Save to separate file items with zero price
    saveFile(zeroprice, JSON.stringify(filter_zeroprice(productList)));

    // Save to separate file items without image
    saveFile(noimages, JSON.stringify(filter_WITHOUTimages(productList)));

    // productList = filter_WITHimages(productList);
    productList = filter_NONzeroprice(productList);

    saveFile(resFile, JSON.stringify(productList));

}

function selectData(importFileData, offerFilata) {
    return {
        products : importFileData.КоммерческаяИнформация.Каталог.Товары.Товар, // .slice(0, 50),
        terms    : importFileData.КоммерческаяИнформация.Классификатор.Свойства.Свойство,
        category : importFileData.КоммерческаяИнформация.Классификатор.Категории.Категория,
        offers   : offerFilata.КоммерческаяИнформация.ПакетПредложений.Предложения.Предложение,
    };
}

function buildProductList(products, terms, category, offers) {

    let i = 0;
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
            price    : +getPrice(offers, el.Ид), // Convert string to int
            code     : i++,
            ...attr,
        }

    });

    return productList;
}

// Look term in voc
function getProperty(voc, term) {
    return voc.find(el => el.Ид === term).Наименование
}

function getValue(voc, term, val) {
    let match = val.match(/-/gi); // Id includes  4 '-'

    // If it is ID
    if (Array.isArray(match) && match.length === 4) {
        let vocBook = voc.find(el => el.Ид === term).ВариантыЗначений.Справочник;
        let valBook = Array.isArray(vocBook) ? vocBook.find(el => el.ИдЗначения === val).Значение : vocBook.Значение;
        return valBook;
    } else {
        // If it is not ID return same value
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


function saveFile(file, data) {
    fs.writeFileSync(file, data)
}

// Transform xml data to JS object
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

function filter_WITHOUTimages(productList) {
    return productList.filter(el => el.img === null);
}

function filter_zeroprice(productList) {
    return productList.filter(el => el.price === 0).sort((a, b) => a.sku.localeCompare(b.sku));
}