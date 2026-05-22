import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MinimizerPlugin from 'minimizer-webpack-plugin';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  mode: 'production',
  entry: {
    background: './background.ts',
    'banner-content-script': './banner-content-script.ts',
    onboarding: './onboarding.ts',
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  target: ['web', 'es6'],
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: true,
    splitChunks: false,
  },
  devtool: false,
  performance: {
    hints: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'banner.css', to: 'banner.css' },
        { from: 'icons', to: 'icons' },
        { from: 'onboarding.html', to: 'onboarding.html' },
      ],
    }),
  ],
};

export default config;
