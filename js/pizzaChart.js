PizzaChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    //this.radius = _radius;
    //console.log("contruc",_parentElement);
    this.initVis();
    //console.log(this.parentElement.node);
};

PizzaChart.prototype.initVis = function(){
    var visPizza = this;
    console.log("parent ", (visPizza.parentElement));
    console.log("merda " + d3.select(visPizza.parentElement));
   
    visPizza = d3.select(visPizza.parentElement).selectAll("circle")
        .attr("fill", "purple");

}