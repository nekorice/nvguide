/*
  a jquery guide plugin 

*/
(function ($, window) {
  'use strict';
  

  var noop = function(){};
  var zindex = 10000;
  var winw = isNaN(window.innerWidth) ? window.clientWidth : window.innerWidth;
  var winh = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;

  //settings default
  var defaults = {
    //默认是否调用targe.click()
    bundle: false,
    //every guide before callback
    onGuideBefore: noop,
    //every guide after callback
    onGuideAfter: noop,
    //all guide done callback
    onGuideDone: noop,
    //start callback
    onGuideStart: noop,
    //tip位置
    timMargin: 75,
    //tip class
    tipClass: 'guide_tip',
  };

  var Guide = function (settings) {
    this.settings = settings;

    this.guideList = [];
    this.guidestep = 0;
    this.tip = $('<div class="guide_tip_base '+ this.settings.tipClass +'"></div>');
    $('body').append(this.tip);
  };
  
  Guide.prototype = {
    //构造函数
    constructor:Guide,
    //添加一个引导步骤
    add:function(target, message, bundle, callback) {
      /*
        target: guide target selector
        message: guide tips
        bundle: 
            trigger target click or not default is false
            传入数字时，表示不需要click，而是使用时间来自动next

        callback: callback when the guide done
      */
      this.guideList.push([target, message, bundle, callback])

      return this
    },   
    //执行下一个引导
    next:function(){
      var self = this;

      if(self.guidestep >= self.guideList.length) {
        self.over();
        return
      }

      //取出参数
      var guideNow = self.guideList[self.guidestep];
      var target = $(guideNow[0]);
      var bundle = guideNow[2];
      var callback = guideNow[3];
      var message = guideNow[1];

      //call guide before callback
      self.settings.onGuideBefore(guideNow);
      
      if(target.length == 0 || target === undefined || target === null){
        $.error(' target is not found: ' + guideNow[0])
      }
      
      var tf = target.offset();
      //target上面覆盖层 阻止target click调用
      var guideBlock = $('<div class="guide_block"></div>');

      function _next() {
        //call callback
        if(callback != undefined){
          callback();
        }

        //call guide after callback
        self.settings.onGuideAfter(guideNow);
        self.next();
      }

      //scroll to makde target is center of the window
      $.when(
        $('body').animate({
          scrollTop: target.offset().top - winh/2 },
          300 )
      ).done(function(){
        //after animate done
        //禁用滚动条
        var overflow = $('body').css('overflow');
        $('body').css('overflow', 'hidden');

        //生成 绘制遮罩
        var shadow = calRects(winw, winh, tf.left, tf.top - $(document).scrollTop(), 
  target.outerWidth(), target.outerHeight())
        //绘制遮罩
        draw(shadow);

        //生成tips
        self.tip.text(message);
        self.tip.css({'top':tf.top - self.settings.timMargin ,'left':tf.left + target.outerWidth()/3, 'z-index':zindex})
        self.tip.show()
            
        guideBlock.css({
          'top':self.tip.offset().top + self.settings.timMargin , 
          'left':tf.left, 
          'width':target.outerWidth(), 
          'height':target.outerHeight(),
        });

        $('body').append(guideBlock);
      
        if(!(isNaN(bundle) || isNaN(parseInt(bundle))) ) {
          //使用timeout触发，而不是click
          var timeid = setTimeout(function(){
            //清理现场
            $('.guide_div').remove()
            self.tip.hide().css({'z-index': -1});
            guideBlock.remove();
            //恢复滚动
            $('body').css('overflow', overflow);
            //console.log('timeout next');
            _next()
          }, bundle);
          //如果需要同时timeout和click
          //click中要删除此timeid
          //clearTimeout(timeid);
        }else{

          guideBlock.click(function(e){
            $('.guide_div').remove()
            self.tip.hide().css({'z-index': -1});
            guideBlock.remove();
            //恢复滚动
            $('body').css('overflow', overflow);
            
            if(bundle === true || self.settings.bundle === true){
              //如果target click是一个异步方法
              $.when(target.click()).done(function(){
                //next
                _next();
                //console.log('next1');
                //处理target.click延时
                //如果click包含ajax方法，把链式的ajax对象作为值 return

              });
            }else{
              //console.log('next2');
              _next();
            }

            e.stopPropagation();
            e.preventDefault();
            return false;
          });

        }// if else

      });//over done
               
      self.guidestep++;
       
      return this
    },
    start:function(){
      //just call next
      this.settings.onGuideStart(this.guideList);
      this.next();
    },
    over:function(){
      this.tip.remove();
      this.settings.onGuideDone(this.guideList);
    },
  };
  
  function calRects(width, height, x, y, w, h) {
    //cal4div
    var rects = {};
    
    rects.left = {
      'x': 0,
      'y': 0,
      'width': x,
      'height': height
    };

    rects.up = {
      'x': x,
      'y': 0,
      'width': width - x,
      'height': y
    };

    rects.right = {
      'x': x + w,
      'y': y,
      'width': width - x - w,
      'height': h
    };

    rects.down = {
      'x': x,
      'y': y + h,
      'width': width - x,
      'height': height - y - h
    };
    return rects;
  }

  function draw(rects) {
    var winWidth = winw;
    var winHeight = winh;
    for (var dir in rects) {

      var rect = rects[dir];
      var gdiv = $('<div></div>');
      gdiv.addClass('guide_div');
      $('body').append(gdiv);
      
      gdiv.css({ width:rect.width, height:rect.height, left:rect.x, top:rect.y });
      
      if(dir=='left'){ 
        gdiv.css({
          left: -rect.width,
          top:0,
        });   
      }else if(dir=='up'){
        gdiv.css({
          top: -rect.height,
          left:0,
          width: winWidth,
        }); 
      }else if(dir=='right'){
        gdiv.css({
          top:0,
          left: winWidth,
          height: winHeight,
        }); 
      }else if(dir=='down'){
        gdiv.css({
          left:0,
          top: winHeight,
          width: winWidth,
        }); 
      }      
        
      gdiv.animate({
        height: rect.height,
        width: rect.width,
        left: rect.x,
        top: rect.y
      }, 'fast');
    }
  }

  $.extend({
      guide: function (options) {
          //获得setting
          var settings = $.extend({}, defaults, options);
          //返回Guide对象
          return new Guide(settings)
      }
  });

})(jQuery, window);

