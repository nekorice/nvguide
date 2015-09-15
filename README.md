# nvguide

a jquery plugin for step by step guide of website

# Demo

see  [http://nekorice.github.io/nvguide/](http://nekorice.github.io/nvguide/)

# Usage

```javascript

   //wait to click step 
   //        target selector, message, trigger target.click or not       
   $.guide().add('.selector', 'step1 click', true)
            .add('.selector2', 'step2 click')
            .start(); 

   //auto step guide
   //        target selector, message, timeout  
   $.guide().add('.selector', 'step1 auto', 500)
            .add('.selector2', 'auto step2', 500)
            .start(); 

```

# Install


#MIT License

See LICENSE file
