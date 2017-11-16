/* eslint-disable global-require */
const express = require('express');
const path = require('path');
const request = require('request');
const compression = require('compression');
const rp = require('request-promise');
const pug = require('pug');
const Remarkable = require('remarkable');
const libPhoneNumber = require('google-libphonenumber');

const PNF = libPhoneNumber.PhoneNumberFormat;
const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
const md = new Remarkable();
md.set({
  html: true,
  breaks: true,
});

const logView = (req) => {
  const partsArr = req.url.split('-');

  if (req.method === 'GET' && partsArr.length > 1) {
    if (!isNaN(parseInt(partsArr[0].replace(/\//g, '')))) {
      const options = {
        uri: `${process.env.API_URL}/landingPageViews/logView`,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        json: {
          studyId: parseInt(partsArr[0].replace(/\//g, '')),
          host: req.headers.host,
          connection: req.headers.connection,
          'cache-control': req.headers['cache-control'],
          'user-agent': req.headers['user-agent'],
          cookie: req.headers.cookie,
          method: req.method,
          ip: req.connection.remoteAddress,
        },
      };

      request(options, (error) => {
        if (error) {
          console.trace(error);
        }
      });
    }
  }
};

// const reserveSsrRoutes = (app) => {
//   // rp({
//   //   uri: 'https://api.studykik.com/api/v1/landingPages/2835078/fetchLanding',
//   //   json: true,
//   // })
//   //   .then((data) => {
//   //     // res.render('landing-page', { data });
//   //     console.log(path.join(__dirname, '../views/landing-page.pug'));
//   //     console.log(data.title);
//   //     console.log(data);
//   //     console.log(pug.compileFile(path.join(__dirname, '../views/landing-page.pug'))({ data }));
//   //     // res.send(pug.compileFile(path.join(__dirname, '../views/landing-page.pug'), { data }));
//   //   })
//   //   .catch(e => {
//   //     // res.send(e.message);
//   //   });
//   app.get(/[0-9]+-*/, async (req, res) => {
//     rp({
//       uri: 'https://api.studykik.com/api/v1/landingPages/2835078/fetchLanding',
//       json: true,
//     })
//       .then((data) => {
//         res.send(pug.compileFile(path.join(__dirname, '../views/landing-page.pug'))({ data }));
//       })
//       .catch(e => {
//         res.send(e.message);
//       });
//   });
// };

const addDevMiddlewares = (app, webpackConfig) => {
// Dev middleware
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);

  const middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    silent: true,
    stats: 'errors-only',
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  app.get('/lv10', (req, res) => res.redirect(301, 'https://studykik.com/4000175-kik-site'));

  app.get('/lv13', (req, res) => res.redirect(301, 'https://studykik.com/4001199-lv13'));

  app.get('/lv14', (req, res) => res.redirect(301, 'https://studykik.com/4001200-lv14'));

  app.get('/lv15', (req, res) => res.redirect(301, 'https://studykik.com/4001549-lv15'));

  app.get('/lv16', (req, res) => res.redirect(301, 'https://studykik.com/4001550-lv16'));

  app.get('/patients', (req, res) => res.redirect(301, 'https://studykik.com/list-your-trials'));

  app.get('/app*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'app.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });

  // for loader.io verification
  app.get('/loaderio-9719d1a0d138bda492e5d8e90a243c6e', (req, res) => {
    res.send('loaderio-9719d1a0d138bda492e5d8e90a243c6e');
  });
  app.get('/loaderio-446030d79af6fc10143acfa9b2f0613f', (req, res) => {
    res.send('loaderio-446030d79af6fc10143acfa9b2f0613f');
  });

  // reserveSsrRoutes(app);
  app.get(/[0-9]+-*/, async (req, res) => {
    rp({
      uri: 'https://api.studykik.com/api/v1/landingPages/2835078/fetchLanding',
      json: true,
    })
      .then((landing) => {
        fs.readFile(path.join(compiler.outputPath, 'corporate.html'), (err, file) => {
          if (err) {
            res.sendStatus(404);
          } else {
            // Used form rendering.
            // const indication = (landing.indication) ? landing.indication : '';
            const city = (landing.city) ? landing.city : '';
            const state = (landing.state) ? landing.state : '';
            const cityAndState = (city && state) ? ` ${city}, ${state}` : '';
            const location = landing.locationMask ? ` ${landing.locationMask}` : cityAndState;
            const title = (landing.title) ? landing.title : indication;
            const fullNamePlaceholder = (landing.fullNamePlaceholder) ? landing.fullNamePlaceholder : '* Full Name';
            const emailPlaceholder = (landing.emailPlaceholder) ? landing.emailPlaceholder : '* Email';
            const phonePlaceholder = (landing.phonePlaceholder) ? landing.phonePlaceholder : '* Mobile Phone';
            const instructions = (landing.instructions) ? landing.instructions : 'Enter your information to join!';
            const signupButtonText = (landing.signupButtonText) ? landing.signupButtonText : 'Sign up now!';
            const clickToCallButtonText = (landing.clickToCallButtonText) ? landing.clickToCallButtonText : 'Click to Call!';
            const clickToCallNumber = (landing.clickToCallButtonNumber) ? `tel:${landing.clickToCallButtonNumber}` : false;

            // Used article rendering.
            const landingDescription = (landing && landing.description && landing.description !== 'seed')
              ? landing.description
              : null;
            const imgSrc = (landing && landing.imgSrc) ? landing.imgSrc : null;
            const dataView = (imgSrc) ? 'slideInRight' : 'fadeInUp';
            const indication = landing.indication;
            const siteName = landing.siteName;
            let address = landing.address;
            const zip = landing.zip;
            if (city) {
              address += `, ${city}`;
            }
            if (state) {
              address += `, ${state}`;
            }
            if (zip) {
              address += `, ${zip}`;
            }
            const bySignUpText = (landing.bySignUpText) ? landing.bySignUpText :
              'By signing up you agree to receive text messages and emails about this and similar studies near you. ' +
              'You can unsubscribe at any time. Text messages and data rates may apply. Refer to Privacy Policy.';
            const ifInterestedInstructions = (landing.ifInterestedInstructions) ? landing.ifInterestedInstructions :
              'If interested, enter information above to sign up!';

            const ssrStr = pug.compileFile(path.join(__dirname, '../views/landing-page.pug'))({
              landing,
              location,
              title,
              fullNamePlaceholder,
              emailPlaceholder,
              phonePlaceholder,
              instructions,
              signupButtonText,
              clickToCallButtonText,
              clickToCallNumber,
              landingDescription,
              imgSrc,
              dataView,
              indication,
              siteName,
              md,
              address,
              bySignUpText,
              ifInterestedInstructions,
              formatPhone: (phone) => {
                let patientPhone;
                const phoneNumber = phoneUtil.parse(phone, '');
                const countryCode = phoneNumber.getCountryCode();
                if (countryCode === 1) {
                  patientPhone = phoneUtil.format(phoneNumber, PNF.NATIONAL);
                } else {
                  patientPhone = phoneUtil.format(phoneNumber, PNF.INTERNATIONAL);
                }
                return patientPhone;
              },
            });
            res.send(file.toString().replace('<div id="app"></div>', ssrStr));
          }
        });
      })
      .catch(e => {
        res.send(e.message);
      });
  });

  app.get('*', (req, res) => {
    logView(req);
    fs.readFile(path.join(compiler.outputPath, 'corporate.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });
};

// Production middlewares
const addProdMiddlewares = (app, options) => {
  const publicPath = options.publicPath || '/';
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'build');

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());
  app.use(publicPath, express.static(outputPath));

  app.get('/app*', (req, res) => res.sendFile(path.resolve(outputPath, 'app.html')));

  app.get('/lv10', (req, res) => res.redirect(301, 'https://studykik.com/4000175-kik-site'));

  app.get('/lv13', (req, res) => res.redirect(301, 'https://studykik.com/4001199-lv13'));

  app.get('/lv14', (req, res) => res.redirect(301, 'https://studykik.com/4001200-lv14'));

  app.get('/lv15', (req, res) => res.redirect(301, 'https://studykik.com/4001549-lv15'));

  app.get('/lv16', (req, res) => res.redirect(301, 'https://studykik.com/4001550-lv16'));

  app.get('/patients', (req, res) => res.redirect(301, 'https://studykik.com/list-your-trials'));

  // for loader.io verification
  app.get('/loaderio-9719d1a0d138bda492e5d8e90a243c6e', (req, res) => {
    res.send('loaderio-9719d1a0d138bda492e5d8e90a243c6e');
  });
  app.get('/loaderio-446030d79af6fc10143acfa9b2f0613f', (req, res) => {
    res.send('loaderio-446030d79af6fc10143acfa9b2f0613f');
  });

  app.get('*', (req, res) => {
    logView(req);
    res.sendFile(path.resolve(outputPath, 'corporate.html'));
  });
};

/**
 * Front-end middleware
 */
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    addProdMiddlewares(app, options);
  } else {
    const webpackConfig = require('../../internals/webpack/webpack.dev.babel');
    addDevMiddlewares(app, webpackConfig);
  }

  return app;
};
