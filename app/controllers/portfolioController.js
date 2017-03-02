let Portfolio = require('../models/portfolio');

let portfolioController={
	createPortfolio:function(newPortfolio, callback)
	{
		newPortfolio.save(callback);
	},
	getPortfolioByName:function(username,callback)
    {
    	var query = {username: username};
    	Portfolio.findOne(query, callback);

    },
    getAllProtfolios:function(req,res,next)
    {
    	var page = req.params.page;
    	Portfolio.find({}).populate({ path: 'portfolios'}).limit(10).skip(10*page)
    	.exec(function(err,portfolios)
    	{
    		Portfolio.count().exec(function(err,count)
    		{
    			if(err)
    			{
    				return next(err);
    			}
    			res.render('viewsummary',{
    				data:portfolios,
    				current:page,
                    req:req,
    				count: Math.ceil(count/10)
    			});
    			

    		});
    	});
    }


}

module.exports=portfolioController;