Aiven Developer
===============

This repository contains code examples from the tutorial on `how to use OpenSearch with NodeJS <https://developer.aiven.io/docs/products/opensearch/howto/get-started-with-nodejs.html#query-the-data>`_.

Running locally
---------------

1. Clone the repository and install the dependencies::

    npm install

2. Copy .env.example, rename to .env and there the service_uri of your OpenSearch cluster.

3. Download full_format_recipes from `Kaggle <https://www.kaggle.com/hugodarwood/epirecipes?select=full_format_recipes.json>`_. Unzip and copy the JSON file to the root folder of this project.

4. Install ``run-func`` to run javascript methods from command line with more convenience::

    npm i -g run-func

You're all set! Retrieve the list of available indices by running

::

    run-func index.js getExistingIndices


License
-------

This work is licensed under a
`Creative Commons Attribution 4.0 International License <http://creativecommons.org/licenses/by/4.0/>`_.





