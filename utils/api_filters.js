const { parse } = require("dotenv");

class APIFilters{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    filter(){
        const queryCopy={...this.queryStr};
        // removeFields
        const removeFields=['sort','fields','q','limit','page'];
        removeFields.forEach(element=>delete queryCopy[element]);
        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/,match=>
        `$${match}`);
        this.query=this.query.find(JSON.parse(queryStr));
        return this ;
    }
    sort(){
        if(this.queryStr.sort){
            const sortBy=this.queryStr.sort.split(',').join(' ');
            console.log(sortBy);
            this.query=this.query.sort(sortBy);
        }
        else{
            this.query=this.query.sort('-postingDate')
        }
        return this;
    }
    limitFields(){
        if(this.queryStr.fields){
            const fields=this.queryStr.fields;
            this.query=this.query.select(fields);
         

        }else{
            this.query=this.query.select('-__V');
        }
        return this;
    }
    searchByQuery(){
        if(this.queryStr){
           const qu= this.queryStr.q.split(',').join(' ');
           this.query=this.query.find(
            {$text:{$search : "\""+qu+"\""}}
           )
        }
        return this;
    }
    pagination(){
        const page= parseInt( this.queryStr.page,10)||1;
        const limit= parseInt( this.queryStr.page,10)||10;
        const skipResult=(page-1)*limit;
        this.query=this.query.skip(skipResult).limit(limit);
    }
}
module.exports=APIFilters;