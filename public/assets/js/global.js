/*--Scroll It--*/
    var $j = jQuery.noConflict();
    $j(function(){
        $j.scrollIt({
            upKey: 38,             // key code to navigate to the next section
            downKey: 40,           // key code to navigate to the previous section
            easing: 'ease',      // the easing function for animation
            scrollTime: 600,       // how long (in ms) the animation takes
            activeClass: 'active', // class given to the active nav element
            onPageChange: null,    // function(pageIndex) that is called when page is changed
            topOffset: -56           // offset (in px) for fixed top navigation         
        });
    }); 
